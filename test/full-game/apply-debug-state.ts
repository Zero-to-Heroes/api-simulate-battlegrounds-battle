import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 12987 }, defender: { entityId: 9978 } },
		{ attacker: { entityId: 12995 }, defender: { entityId: 9984 } },
		{ attacker: { entityId: 12997 }, defender: { entityId: 9984 } },
		{ attacker: { entityId: 9976 }, defender: { entityId: 12995 } },
		{ attacker: { attack: 6, health: 9 }, defender: { entityId: 13002 } },
	];
};
