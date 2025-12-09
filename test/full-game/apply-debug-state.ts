import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 5708 }, defender: { entityId: 6310 } },
		{ attacker: { entityId: 5708 }, defender: { entityId: 6310 } },
		{ attacker: { entityId: 6304 }, defender: { entityId: 5708 } },
		{ attacker: { entityId: 4623 }, defender: { entityId: 6310 } },
		{ attacker: { entityId: 6309 }, defender: { entityId: 4641 } },
		{ attacker: { entityId: 4643 }, defender: { entityId: 6313 } },
		{ attacker: { entityId: 6312 }, defender: { entityId: 4641 } },
		{ attacker: { entityId: 4628 }, defender: { entityId: 6314 } },
		{ attacker: { entityId: 6304 }, defender: { entityId: 4643 } },
		{ attacker: { entityId: 4633 }, defender: { entityId: 6309 } },
		{ attacker: { entityId: 6304 }, defender: { entityId: 4641 } },
	];
};
