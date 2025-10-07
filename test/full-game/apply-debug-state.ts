import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 21412 }, defender: { entityId: 19430 } },
		{ attacker: { entityId: 19395 }, defender: { entityId: 21428 } },
		{ attacker: { entityId: 21418 }, defender: { entityId: 19400 } },
	];
};
