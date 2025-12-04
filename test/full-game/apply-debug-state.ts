import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 8276 }, defender: { entityId: 11231 } },
		{ attacker: { entityId: 8289 }, defender: { entityId: 11234 } },
		{ attacker: { entityId: 5996 }, defender: { entityId: 11234 } },
		{ attacker: { entityId: 8276 }, defender: { entityId: 11217 } },
		{ attacker: { entityId: 11223 }, defender: { entityId: 8281 } },
	];
};
