import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 16570 }, defender: { entityId: 15508 } },
		{ attacker: { entityId: 15300 }, defender: { entityId: 16609 } },
		{ attacker: { entityId: 16576 }, defender: { entityId: 15998 } },
		{ attacker: { entityId: 15310 }, defender: { entityId: 16609 } },
		{ attacker: { entityId: 16586 }, defender: { entityId: 15310 } },
		{ attacker: { entityId: 16586 }, defender: { entityId: 15327 } },
		{ attacker: { entityId: 15319 }, defender: { entityId: 16599 } },
		{ attacker: { entityId: 16599 }, defender: { entityId: 15319 } },
	];
};
