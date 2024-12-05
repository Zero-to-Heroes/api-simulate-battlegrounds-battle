import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 11217 }, defender: { entityId: 13770 } },
		{ attacker: { entityId: 13775 }, defender: { entityId: 11238 } },
		{ attacker: { entityId: 13775 }, defender: { entityId: 11238 } },
		{ attacker: { entityId: 11226 }, defender: { entityId: 13790 } },
		{ attacker: { entityId: 13794 }, defender: { entityId: 11228 } },
		{ attacker: { entityId: 11228 }, defender: { entityId: 13775 } },
		{ attacker: { attack: 8, health: 1 }, defender: { entityId: 12831 } },
		{ attacker: { entityId: 11235 }, defender: { entityId: 13803 } },
	];
};
