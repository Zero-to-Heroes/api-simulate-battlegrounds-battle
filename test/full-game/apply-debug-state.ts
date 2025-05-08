import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 3056 }, defender: { entityId: 4097 } },
		{ attacker: { entityId: 4091 }, defender: { entityId: 3062 } },
		{ attacker: { entityId: 3059 }, defender: { entityId: 4093 } },
		{ attacker: { entityId: 4092 }, defender: { entityId: 3062 } },
		{ attacker: { entityId: 3062 }, defender: { entityId: 4099 } },
		{ attacker: { entityId: 4095 }, defender: { entityId: 3062 } },
	];
};
