import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 1979 }, defender: { entityId: 1577 } },
		{ attacker: { entityId: 1983 }, defender: { entityId: 1616 } },
		// { attacker: { entityId: 1351 }, defender: { entityId: 608 } },
	];
};
