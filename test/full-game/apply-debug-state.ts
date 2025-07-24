import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 7171 }, defender: { entityId: 5086 } },
		{ attacker: { entityId: 7174 }, defender: { entityId: 5664 } },
		{ attacker: { entityId: 7179 }, defender: { entityId: 5664 } },
		{ attacker: { entityId: 5082 }, defender: { entityId: 7171 } },
	];
};
