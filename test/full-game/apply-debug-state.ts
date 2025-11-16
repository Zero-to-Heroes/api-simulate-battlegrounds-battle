import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 14041 }, defender: { entityId: 17156 } },
		{ attacker: { entityId: 14041 }, defender: { entityId: 17147 } },
		{ attacker: { entityId: 17099 }, defender: { entityId: 15979 } },
		{ attacker: { entityId: 14049 }, defender: { entityId: 17156 } },
		{ attacker: { entityId: 14049 }, defender: { entityId: 17147 } },
		{ attacker: { entityId: 17113 }, defender: { entityId: 15979 } },
		{ attacker: { attack: 10, health: 1 }, defender: { entityId: 17099 } },
		{ attacker: { entityId: 17122 }, defender: { entityId: 14948 } },
		{ attacker: { entityId: 14058 }, defender: { entityId: 17099 } },
		{ attacker: { entityId: 17127 }, defender: { entityId: 14948 } },
		{ attacker: { entityId: 17129 }, defender: { entityId: 14948 } },
		{ attacker: { entityId: 14064 }, defender: { entityId: 17113 } },
		{ attacker: { entityId: 14064 }, defender: { entityId: 17129 } },
	];
};
