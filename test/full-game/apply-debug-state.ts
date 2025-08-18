import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 5298 }, defender: { entityId: 6656 } },
		{ attacker: { entityId: 5298 }, defender: { entityId: 6649 } },
		{ attacker: { entityId: 5299 }, defender: { entityId: 6656 } },
		{ attacker: { entityId: 5300 }, defender: { entityId: 6656 } },
		{ attacker: { entityId: 5301 }, defender: { entityId: 6652 } },
		{ attacker: { attack: 1, health: 1 }, defender: { entityId: 4889 } },
		{ attacker: { entityId: 5302 }, defender: { entityId: 6658 } },
	];
};
