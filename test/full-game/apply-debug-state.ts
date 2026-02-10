import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 12204 }, defender: { entityId: 10049 } },
		{ attacker: { entityId: 12787 }, defender: { entityId: 12210 } },
		{ attacker: { entityId: 12205 }, defender: { entityId: 10066 } },
		{ attacker: { entityId: 10049 }, defender: { entityId: 10066 } },
	];
};
