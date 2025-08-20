import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 10071 }, defender: { entityId: 12229 } },
		{ attacker: { entityId: 12226 }, defender: { entityId: 10092 } },
		{ attacker: { entityId: 10078 }, defender: { entityId: 12246 } },
		{ attacker: { entityId: 12234 }, defender: { entityId: 10071 } },
		{ attacker: { entityId: 7074 }, defender: { entityId: 12242 } },
		{ attacker: { entityId: 12448 }, defender: { entityId: 7074 } },
	];
};
