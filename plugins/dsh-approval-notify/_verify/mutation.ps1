$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$pluginRoot = Split-Path -Parent $here
$target = Join-Path $pluginRoot 'client/index.js'
$suite  = Join-Path $here 'notify.test.mjs'
$orig = Get-Content $target -Raw
$nl = "`n"
$muts = @(
  @{ n='drop-next';     from='return typeof next === ''function'' ? next(request) : undefined;'; to='return undefined;' },
  @{ n='always-notify'; from='if (windowIsOutOfSight()) notifyApproval(request, t);';                to='notifyApproval(request, t);' },
  @{ n='no-dedupe';     from='if (notified.has(key)) return;';                                       to='void 0;' },
  @{ n='no-catch';      from='} catch (error) {' + $nl + '                console.warn(`${NS}: approval notification failed`, error);' + $nl + '              }'; to='} finally {}' }
)
$survived = 0
foreach ($m in $muts) {
  $mut = $orig.Replace($m.from, $m.to)
  if ($mut -eq $orig) { Write-Output ("{0,-14} : NOT APPLIED" -f $m.n); $survived++; continue }
  $bak = "$target.mut"
  Copy-Item $target $bak -Force
  try { Set-Content -Path $target -Value $mut -NoNewline; & node $suite *> $null; $code = $LASTEXITCODE }
  finally { Move-Item $bak $target -Force }
  if ($code -ne 0) { Write-Output ("{0,-14} : KILLED" -f $m.n) } else { Write-Output ("{0,-14} : SURVIVED (weak)" -f $m.n); $survived++ }
}
Write-Output '--- restored ---'
& node $suite | Select-Object -Last 1
if ($survived -ne 0) { exit 1 }
