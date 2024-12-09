import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 10523 }, defender: { entityId: 8539 } },
		{ attacker: { entityId: 8531 }, defender: { entityId: 10537 } },
		{ attacker: { entityId: 10537 }, defender: { entityId: 8531 } },
		{ attacker: { entityId: 8543 }, defender: { entityId: 10544 } },
		{ attacker: { entityId: 10544 }, defender: { entityId: 8554 } },
		{ attacker: { entityId: 9809 }, defender: { entityId: 10565 } },
		{ attacker: { entityId: 10548 }, defender: { entityId: 8560 } },
		{ attacker: { entityId: 9913 }, defender: { entityId: 10565 } },
		{ attacker: { entityId: 10555 }, defender: { entityId: 8543 } },
		{ attacker: { entityId: 8560 }, defender: { entityId: 10544 } },
		{ attacker: { entityId: 10563 }, defender: { entityId: 9913 } },
		{ attacker: { entityId: 8543 }, defender: { entityId: 10523 } },
		{ attacker: { entityId: 10555 }, defender: { entityId: 9913 } },
	];
};
