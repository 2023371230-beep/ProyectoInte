Set-Location .\backend
$ErrorActionPreference='Stop'

$base = 'http://localhost:3001/api'

function Invoke-TestRequest {
  param(
    [string]$Method,
    [string]$Path,
    $Body = $null,
    [string]$Token = $null
  )

  $uri = "$base$Path"
  $headers = @{}
  if ($Token) { $headers['Authorization'] = "Bearer $Token" }

  try {
    if ($null -ne $Body) {
      $json = ($Body | ConvertTo-Json -Depth 10)
      $resp = Invoke-WebRequest -Method $Method -Uri $uri -Headers $headers -ContentType 'application/json' -Body $json -UseBasicParsing
    } else {
      $resp = Invoke-WebRequest -Method $Method -Uri $uri -Headers $headers -UseBasicParsing
    }
    [pscustomobject]@{ ok=$true; status=[int]$resp.StatusCode; body=($resp.Content | ConvertFrom-Json) }
  } catch {
    $status = 0
    $parsed = $null
    if ($_.Exception.Response) {
      $status = [int]$_.Exception.Response.StatusCode.value__
      try {
        $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $raw = $sr.ReadToEnd()
        if ($raw) { $parsed = $raw | ConvertFrom-Json }
      } catch {}
    }
    [pscustomobject]@{ ok=$false; status=$status; body=$parsed; error=$_.Exception.Message }
  }
}

$stamp = Get-Date -Format 'yyyyMMddHHmmss'
$clientAEmail = "qa.a.$stamp@mailinator.com"
$clientBEmail = "qa.b.$stamp@mailinator.com"
$password = 'Qa123456!'

$report = [ordered]@{}
$report.status = Invoke-TestRequest -Method GET -Path '/status'

$adminLogin = Invoke-TestRequest -Method POST -Path '/auth/login-admin' -Body @{ email='admin@clinica.com'; password='Admin123!' }
$report.login_admin = $adminLogin
$adminToken = if ($adminLogin.ok) { $adminLogin.body.token } else { $null }

$regA = Invoke-TestRequest -Method POST -Path '/auth/register' -Body @{ nombre='QA Cliente A'; email=$clientAEmail; password=$password; diagnostico='dx qa a'; telefono='5550001111' }
$regB = Invoke-TestRequest -Method POST -Path '/auth/register' -Body @{ nombre='QA Cliente B'; email=$clientBEmail; password=$password; diagnostico='dx qa b'; telefono='5550002222' }
$loginA = Invoke-TestRequest -Method POST -Path '/auth/login' -Body @{ email=$clientAEmail; password=$password }
$loginB = Invoke-TestRequest -Method POST -Path '/auth/login' -Body @{ email=$clientBEmail; password=$password }
$report.register_client_a = $regA
$report.register_client_b = $regB
$report.login_client_a = $loginA
$report.login_client_b = $loginB
$tokenA = if ($loginA.ok) { $loginA.body.token } else { $null }
$tokenB = if ($loginB.ok) { $loginB.body.token } else { $null }

$report.login_admin_with_client = Invoke-TestRequest -Method POST -Path '/auth/login-admin' -Body @{ email=$clientAEmail; password=$password }
$report.dashboard_without_token = Invoke-TestRequest -Method GET -Path '/dashboard/resumen'
$report.dashboard_with_admin = Invoke-TestRequest -Method GET -Path '/dashboard/resumen' -Token $adminToken

$list1 = Invoke-TestRequest -Method GET -Path '/clientes' -Token $adminToken
$report.clientes_list_before = $list1
$idClienteA = $null
$idClienteB = $null
if ($list1.ok) {
  $foundA = $list1.body | Where-Object { $_.email -eq $clientAEmail } | Select-Object -First 1
  $foundB = $list1.body | Where-Object { $_.email -eq $clientBEmail } | Select-Object -First 1
  if ($foundA) { $idClienteA = [int]$foundA.id_cliente }
  if ($foundB) { $idClienteB = [int]$foundB.id_cliente }
}
$report.id_cliente_a = $idClienteA
$report.id_cliente_b = $idClienteB

$editA = $null
if ($idClienteA) {
  $editA = Invoke-TestRequest -Method PUT -Path "/clientes/$idClienteA" -Token $adminToken -Body @{ nombre='QA Cliente A Edit'; email=$clientAEmail; diagnostico='dx edit'; telefono='5559991111' }
}
$report.cliente_edit_a = $editA

$report.client_can_list_clientes = Invoke-TestRequest -Method GET -Path '/clientes' -Token $tokenA
$report.client_can_create_medicamento = Invoke-TestRequest -Method POST -Path '/medicamentos' -Token $tokenA -Body @{ nombre="QA MED CLIENT $stamp"; descripcion='test' }
$report.client_can_create_video = Invoke-TestRequest -Method POST -Path '/videos' -Token $tokenA -Body @{ titulo="QA VIDEO CLIENT $stamp"; youtube_id="qa$stamp"; categoria='qa' }

$medCreate = Invoke-TestRequest -Method POST -Path '/medicamentos' -Token $adminToken -Body @{ nombre="QA MED ADMIN $stamp"; descripcion='desde qa' }
$videoCreate = Invoke-TestRequest -Method POST -Path '/videos' -Token $adminToken -Body @{ titulo="QA VIDEO ADMIN $stamp"; youtube_id="QAT$stamp"; categoria='qa' }
$report.med_create_admin = $medCreate
$report.video_create_admin = $videoCreate
$medId = if ($medCreate.ok) { [int]$medCreate.body.id_medicamento } else { $null }
$videoId = if ($videoCreate.ok) { [int]$videoCreate.body.id_video } else { $null }
$report.med_id = $medId
$report.video_id = $videoId

$assignMed = $null
$assignVid = $null
if ($idClienteB -and $medId) {
  $assignMed = Invoke-TestRequest -Method POST -Path '/medicamentos/asignar' -Token $adminToken -Body @{ id_cliente=$idClienteB; id_medicamento=$medId; dosis='1 tableta'; frecuencia='cada 8h'; hora_inicio=$null }
}
if ($idClienteB -and $videoId) {
  $assignVid = Invoke-TestRequest -Method POST -Path '/videos/asignar' -Token $adminToken -Body @{ id_cliente=$idClienteB; id_video=$videoId }
}
$report.assign_med_to_b = $assignMed
$report.assign_video_to_b = $assignVid

$detailB = $null
if ($idClienteB) { $detailB = Invoke-TestRequest -Method GET -Path "/clientes/$idClienteB/detalle" -Token $adminToken }
$report.cliente_b_detalle = $detailB

$report.mis_medicamentos_b = Invoke-TestRequest -Method GET -Path '/medicamentos/mis-medicamentos' -Token $tokenB
$report.mis_videos_b_before_pay = Invoke-TestRequest -Method GET -Path '/videos/mis-videos' -Token $tokenB
$report.suscripcion_b_before_pay = Invoke-TestRequest -Method GET -Path '/suscripciones/mia' -Token $tokenB

$payB = Invoke-TestRequest -Method POST -Path '/pagos' -Token $tokenB -Body @{ monto = 199 }
$report.pay_b = $payB
$report.suscripcion_b_after_pay = Invoke-TestRequest -Method GET -Path '/suscripciones/mia' -Token $tokenB

$idUsuarioA = if ($loginA.ok) { [int]$loginA.body.usuario.id_usuario } else { $null }
$report.id_usuario_a = $idUsuarioA
if ($idUsuarioA) {
  $report.pay_b_spoof_id_usuario_a = Invoke-TestRequest -Method POST -Path '/pagos' -Token $tokenB -Body @{ id_usuario=$idUsuarioA; monto=199 }
  $report.suscripcion_a_after_spoof_attempt = Invoke-TestRequest -Method GET -Path '/suscripciones/mia' -Token $tokenA
}

$deactivateA = $null
if ($idClienteA) { $deactivateA = Invoke-TestRequest -Method DELETE -Path "/clientes/$idClienteA" -Token $adminToken }
$report.deactivate_a = $deactivateA
$report.login_client_a_after_deactivate = Invoke-TestRequest -Method POST -Path '/auth/login' -Body @{ email=$clientAEmail; password=$password }
$report.list_clientes_after_deactivate = Invoke-TestRequest -Method GET -Path '/clientes' -Token $adminToken
$report.paypal_crear_orden_b = Invoke-TestRequest -Method POST -Path '/paypal/crear-orden' -Token $tokenB -Body @{}

$report | ConvertTo-Json -Depth 12
