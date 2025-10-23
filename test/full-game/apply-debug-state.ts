import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 17316 }, defender: { entityId: 18529 } },
		{ attacker: { entityId: 17316 }, defender: { entityId: 18516 } },
		{ attacker: { entityId: 18475 }, defender: { entityId: 17333 } },
		{ attacker: { entityId: 18040 }, defender: { entityId: 18529 } },
		{ attacker: { entityId: 18040 }, defender: { entityId: 18529 } },
		{ attacker: { entityId: 18483 }, defender: { entityId: 17348 } },
	];
};
