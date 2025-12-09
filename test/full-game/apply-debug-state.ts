import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 22320 }, defender: { entityId: 20719 } },
		{ attacker: { entityId: 20682 }, defender: { entityId: 22363 } },
		{ attacker: { entityId: 20682 }, defender: { entityId: 22359 } },
		{ attacker: { entityId: 22333 }, defender: { entityId: 20703 } },
		{ attacker: { entityId: 20691 }, defender: { entityId: 22368 } },
		{ attacker: { entityId: 22344 }, defender: { entityId: 22540 } },
		{ attacker: { entityId: 22344 }, defender: { entityId: 22540 } },
		{ attacker: { attack: 3, health: 3 }, defender: { entityId: 22368 } },
		{ attacker: { attack: 3, health: 3 }, defender: { entityId: 22368 } },
		{ attacker: { entityId: 22559 }, defender: { entityId: 22368 } },
	];
};
