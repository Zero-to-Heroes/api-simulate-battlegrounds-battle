import { BgsPlayerEntity, BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { SoCInput } from '../simulation/start-of-combat/start-of-combat-input';

export interface Card {
	startOfCombat?: (
		trinket: BoardEntity | BoardTrinket | BgsPlayerEntity,
		input: SoCInput,
	) => boolean | { hasTriggered: boolean; shouldRecomputeCurrentAttacker: boolean };
}
export interface StartOfCombatCard extends Card {
	startOfCombatTiming?: StartOfCombatTiming;
	startOfCombat: NonNullable<Card['startOfCombat']>;
}
export type StartOfCombatTiming = 'start-of-combat' | 'pre-combat' | 'illidan';
