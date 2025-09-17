import { CardIds } from '../services/card-ids';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnDeathrattleTriggered } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { FullGameState } from './internal-game-state';
import { onQuestProgressUpdated } from './quest';

export interface DeathrattleTriggeredInput {
	readonly boardWithDeadEntity: BoardEntity[];
	readonly boardWithDeadEntityHero: BgsPlayerEntity;
	readonly deadEntity: BoardEntity;
	readonly otherBoard: BoardEntity[];
	readonly otherBoardHero: BgsPlayerEntity;
	readonly deadEntityIndexFromRight?: number;
	readonly gameState: FullGameState;
}

export const onDeathrattleTriggered = (input: DeathrattleTriggeredInput) => {
	for (const boardEntity of input.boardWithDeadEntity) {
		const onDeathrattleTriggered = cardMappings[boardEntity.cardId];
		if (hasOnDeathrattleTriggered(onDeathrattleTriggered)) {
			onDeathrattleTriggered.onDeathrattleTriggered(boardEntity, input);
		}
	}
	for (const trinket of input.boardWithDeadEntityHero.trinkets ?? []) {
		const onDeathrattleTriggered = cardMappings[trinket.cardId];
		if (hasOnDeathrattleTriggered(onDeathrattleTriggered)) {
			onDeathrattleTriggered.onDeathrattleTriggered(trinket, input);
		}
	}

	const quests = input.boardWithDeadEntityHero.questEntities ?? [];
	for (const quest of quests) {
		switch (quest.CardId) {
			case CardIds.ExhumeTheBones:
				onQuestProgressUpdated(
					input.boardWithDeadEntityHero,
					quest,
					input.boardWithDeadEntity,
					input.gameState,
				);
				break;
		}
	}

	input.boardWithDeadEntityHero.trinkets
		.filter((t) => t.cardId === CardIds.DeathlyPhylactery_BG30_MagicItem_700)
		.forEach((t) => {
			t.scriptDataNum1 = 0;
		});
};
