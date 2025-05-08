import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 4704 }, defender: { entityId: 3535 } },
		{ attacker: { entityId: 3535 }, defender: { entityId: 4711 } },
		{ attacker: { entityId: 4707 }, defender: { entityId: 3541 } },
		{ attacker: { entityId: 3541 }, defender: { entityId: 4712 } },
		{ attacker: { entityId: 4708 }, defender: { entityId: 3549 } },
		{ attacker: { entityId: 3544 }, defender: { entityId: 4715 } },
		{ attacker: { entityId: 4712 }, defender: { entityId: 3541 } },
	];
};
