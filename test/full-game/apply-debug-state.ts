import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 8807 }, defender: { entityId: 6276 } },
		{ attacker: { entityId: 6274 }, defender: { entityId: 8822 } },
		{ attacker: { entityId: 9128 }, defender: { entityId: 7647 } },
	];
};
