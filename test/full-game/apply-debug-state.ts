import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 5023 }, defender: { entityId: 5887 } },
		{ attacker: { entityId: 5878 }, defender: { entityId: 4271 } },
		{ attacker: { entityId: 4259 }, defender: { entityId: 5890 } },
		{ attacker: { entityId: 5880 }, defender: { entityId: 4271 } },
		{ attacker: { entityId: 5880 }, defender: { entityId: 5308 } },
		{ attacker: { entityId: 4265 }, defender: { entityId: 5880 } },
	];
};
