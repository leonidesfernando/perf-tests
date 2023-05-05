@echo off

set currentPath=%cd%
set nUsers=%~1

IF EXIST "%currentPath%\reportResult.jtl" DEL /s /Q "reportResult.jtl" 1>nul

@echo on
@echo "Removing previous reports data if exists"
@echo off
IF EXIST "%currentPath%\report\" rmdir /q/s report & @echo "  /> report folder REMOVED OK"
IF EXIST "%currentPath%\jmeter.log" DEL /s /Q "%currentPath%\jmeter.log" 1>nul & @echo "  /> jmeter.log folder REMOVED OK"
IF EXIST "%currentPath%\temp\" RMDIR /Q/S %currentPath%\temp & @echo "  /> temp folder REMOVED OK"


IF "%~1" == "" set nUsers=5


@echo "Running with: " %nUsers% " users"


@echo on
@echo "Running JMeter Tests and generating dashboard report"
jmeter -n -t BackEnd-Perf-Test.jmx -J%nUsers% -l reportResult.jtl & jmeter -g reportResult.jtl -o report
