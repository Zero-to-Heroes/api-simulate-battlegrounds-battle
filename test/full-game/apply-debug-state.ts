import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 5337 }, defender: { entityId: 6570 } },
		{ attacker: { entityId: 4687 }, defender: { entityId: 6550 } },
		{ attacker: { entityId: 4688 }, defender: { entityId: 6566 } },
		{ attacker: { attack: 1, health: 1 }, defender: { entityId: 6558 } },
		{ attacker: { entityId: 6562 }, defender: { entityId: 4690 } },
		{ attacker: { entityId: 4689 }, defender: { entityId: 6562 } },
		{ attacker: { entityId: 6566 }, defender: { entityId: 4686 } },
		{ attacker: { attack: 5, health: 3 }, defender: { attack: 14, health: 4 } },
		{ attacker: { entityId: 6550 }, defender: { attack: 3, health: 2 } },
	];
};
