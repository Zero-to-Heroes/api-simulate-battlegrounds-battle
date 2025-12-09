import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 20702 }, defender: { entityId: 18244 } },
		{ attacker: { entityId: 18244 }, defender: { entityId: 20706 } },
		{ attacker: { entityId: 20705 }, defender: { entityId: 18244 } },
		{ attacker: { entityId: 18248 }, defender: { entityId: 20706 } },
		{ attacker: { entityId: 18248 }, defender: { entityId: 20710 } },
		{ attacker: { entityId: 20710 }, defender: { entityId: 18259 } },
		{ attacker: { entityId: 18254 }, defender: { entityId: 20710 } },
	];
};
