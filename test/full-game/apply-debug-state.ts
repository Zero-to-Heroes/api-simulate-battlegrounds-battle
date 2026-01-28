import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 4240 }, defender: { entityId: 6002 } },
		{ attacker: { entityId: 5993 }, defender: { entityId: 4242 } },
		{ attacker: { entityId: 4238 }, defender: { entityId: 6000 } },
		{ attacker: { attack: 6, health: 4 }, defender: { entityId: 4242 } },
		{ attacker: { entityId: 5120 }, defender: { entityId: 6000 } },
		{ attacker: { entityId: 5997 }, defender: { entityId: 4249 } },
	];
};
