import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 19558 }, defender: { entityId: 20067 } },
		{ attacker: { entityId: 20028 }, defender: { entityId: 18432 } },
		{ attacker: { entityId: 18385 }, defender: { entityId: 20067 } },
		{ attacker: { entityId: 20040 }, defender: { entityId: 18443 } },
		{ attacker: { entityId: 18397 }, defender: { entityId: 20091 } },
		{ attacker: { entityId: 20052 }, defender: { entityId: 18418 } },
		{ attacker: { entityId: 18409 }, defender: { entityId: 20091 } },
		{ attacker: { entityId: 20059 }, defender: { entityId: 18432 } },
		{ attacker: { entityId: 18418 }, defender: { entityId: 20083 } },
		{ attacker: { entityId: 20091 }, defender: { entityId: 18418 } },
		{ attacker: { entityId: 18385 }, defender: { entityId: 20052 } },
		{ attacker: { entityId: 20028 }, defender: { entityId: 18418 } },
		{ attacker: { entityId: 18397 }, defender: { entityId: 20040 } },
		{ attacker: { entityId: 20040 }, defender: { entityId: 18409 } },
		{ attacker: { entityId: 18385 }, defender: { entityId: 20059 } },
		{ attacker: { entityId: 20028 }, defender: { entityId: 18385 } },
	];
};
