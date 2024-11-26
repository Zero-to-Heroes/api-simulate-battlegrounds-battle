import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { BattlecryCard, DeathrattleEffectCard } from '../../card.interface';

export const DancingBarnstormer: BattlecryCard & DeathrattleEffectCard = {
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		// Do nothing, it impacts only the tavern
	},
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		// Do nothing, it impacts only the tavern
	},
};
