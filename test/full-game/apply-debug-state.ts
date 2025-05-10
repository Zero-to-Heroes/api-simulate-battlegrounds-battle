import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 3262 }, defender: { entityId: 4327 } },
		{ attacker: { entityId: 3262 }, defender: { entityId: 4327 } },
		{ attacker: { entityId: 4321 }, defender: { entityId: 3825 } },
		{ attacker: { entityId: 3825 }, defender: { entityId: 4327 } },
		{ attacker: { entityId: 4322 }, defender: { entityId: 3271 } },
		{ attacker: { entityId: 3266 }, defender: { entityId: 4321 } },
		{ attacker: { entityId: 4323 }, defender: { entityId: 3268 } },
		{ attacker: { entityId: 3780 }, defender: { entityId: 4322 } },
		{ attacker: { entityId: 4324 }, defender: { entityId: 3270 } },
		{ attacker: { entityId: 3268 }, defender: { entityId: 4326 } },
	];
};
