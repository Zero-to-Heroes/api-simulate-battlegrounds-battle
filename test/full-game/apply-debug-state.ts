import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 25972 }, defender: { entityId: 24223 } },
		{ attacker: { attack: 1, health: 1 }, defender: { entityId: 25992 } },
		{ attacker: { attack: 6, health: 26 }, defender: { entityId: 24975 } },
	];
};
