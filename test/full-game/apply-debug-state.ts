import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 5428 }, defender: { entityId: 3807 } },
		{ attacker: { entityId: 3798 }, defender: { entityId: 5435 } },
		{ attacker: { entityId: 5429 }, defender: { entityId: 4622 } },
		{ attacker: { entityId: 3800 }, defender: { entityId: 5438 } },
		{ attacker: { entityId: 5431 }, defender: { entityId: 3805 } },
		{ attacker: { entityId: 3802 }, defender: { entityId: 5435 } },
		{ attacker: { entityId: 5433 }, defender: { entityId: 3798 } },
		{ attacker: { entityId: 3803 }, defender: { entityId: 5431 } },
		{ attacker: { entityId: 5434 }, defender: { entityId: 4622 } },
		{ attacker: { entityId: 3807 }, defender: { entityId: 5429 } },
		{ attacker: { entityId: 5429 }, defender: { entityId: 4622 } },
		{ attacker: { entityId: 3798 }, defender: { entityId: 5434 } },
		{ attacker: { entityId: 5431 }, defender: { entityId: 3803 } },
		{ attacker: { entityId: 3800 }, defender: { entityId: 5429 } },
		{ attacker: { entityId: 5429 }, defender: { entityId: 5718 } },
		{ attacker: { entityId: 5718 }, defender: { entityId: 5431 } },
	];
};
