import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 5868 }, defender: { entityId: 7744 } },
		{ attacker: { entityId: 7747 }, defender: { entityId: 5876 } },
		{ attacker: { entityId: 7747 }, defender: { entityId: 5868 } },
		{ attacker: { entityId: 5876 }, defender: { entityId: 7768 } },
		{ attacker: { entityId: 7751 }, defender: { entityId: 5868 } },
		{ attacker: { attack: 1, health: 1 }, defender: { entityId: 7755 } },
		{ attacker: { entityId: 7755 }, defender: { attack: 6, health: 1 } },
		{ attacker: { attack: 6, health: 1 }, defender: { entityId: 7755 } },
		{ attacker: { entityId: 7762 }, defender: { entityId: 6740 } },
		{ attacker: { entityId: 6734 }, defender: { entityId: 7762 } },
		{ attacker: { entityId: 7765 }, defender: { entityId: 5890 } },
		{ attacker: { entityId: 5883 }, defender: { entityId: 7762 } },
		{ attacker: { entityId: 7755 }, defender: { attack: 1, health: 1 } },
		{ attacker: { entityId: 5888 }, defender: { entityId: 7762 } },
		{ attacker: { entityId: 7765 }, defender: { attack: 1, health: 1 } },
		{ attacker: { attack: 14, health: 4 }, defender: { entityId: 7755 } },
		{ attacker: { entityId: 7755 }, defender: { attack: 14, health: 4 } },
		{ attacker: { attack: 1, health: 1 }, defender: { entityId: 7765 } },
	];
};
