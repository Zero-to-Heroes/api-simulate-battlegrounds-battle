import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [{ attacker: { entityId: 8933 }, defender: { attack: 32, health: 32 } }];
};
