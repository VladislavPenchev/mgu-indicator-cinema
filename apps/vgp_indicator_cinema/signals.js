'use strict';
// BMW activeFunctionIndicateDirection enum, also exposed as names by SOME/IP.
const left = [7,9,18,20,22], right = [8,10,19,21,23];
function direction(v) {
    const x = v && typeof v === 'object' ? v.activeFunctionIndicateDirection : v;
    if (x === 0 || x === 'BLINKEN_AUS') return 'off';
    if (left.indexOf(x) >= 0) return 'left';
    if (right.indexOf(x) >= 0) return 'right';
    // Only manual hazards trigger the romance clip; alarms/crash/emergency braking do not.
    if (x === 6 || x === 'WARNBLINKEN_MANUELL') return 'hazards';
    if (typeof x === 'string' && /^(DAUERBLINKEN|TIPPBLINKEN|FAS_RICHTUNGSBLINKEN_(LOWPRIO|MIDPRIO|HIGHPRIO))_LINKS$/.test(x)) return 'left';
    if (typeof x === 'string' && /^(DAUERBLINKEN|TIPPBLINKEN|FAS_RICHTUNGSBLINKEN_(LOWPRIO|MIDPRIO|HIGHPRIO))_RECHTS$/.test(x)) return 'right';
    return null;
}
module.exports = {direction};
