import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 9098 }, defender: { entityId: 6957 } },
		{ attacker: { entityId: 6950 }, defender: { entityId: 9099 } },
		{ attacker: { entityId: 9100 }, defender: { entityId: 6957 } },
		{ attacker: { entityId: 9508 }, defender: { entityId: 9104 } },
		{ attacker: { entityId: 9106 }, defender: { entityId: 6960 } },
		{ attacker: { entityId: 6955 }, defender: { entityId: 9108 } },
		{ attacker: { entityId: 9110 }, defender: { entityId: 6962 } },
	];
};
