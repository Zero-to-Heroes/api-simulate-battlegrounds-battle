import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 4053 }, defender: { entityId: 2678 } },
		{ attacker: { entityId: 4053 }, defender: { entityId: 2680 } },
		{ attacker: { attack: 2, health: 2 }, defender: { entityId: 4064 } },
		{ attacker: { entityId: 3491 }, defender: { entityId: 4064 } },
		{ attacker: { entityId: 4058 }, defender: { entityId: 3652 } },
		{ attacker: { entityId: 4061 }, defender: { entityId: 3491 } },
	];
};
