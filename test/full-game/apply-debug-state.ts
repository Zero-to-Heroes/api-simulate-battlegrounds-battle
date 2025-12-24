import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 2956 }, defender: { entityId: 5350 } },
		{ attacker: { entityId: 5348 }, defender: { entityId: 7410 } },
		{ attacker: { entityId: 7401 }, defender: { entityId: 5350 } },
		{ attacker: { entityId: 6349 }, defender: { entityId: 7410 } },
		{ attacker: { entityId: 5350 }, defender: { entityId: 7410 } },
		{ attacker: { entityId: 7403 }, defender: { entityId: 6482 } },
		{ attacker: { entityId: 7405 }, defender: { entityId: 6380 } },
		{ attacker: { entityId: 7406 }, defender: { entityId: 6380 } },
	];
};
