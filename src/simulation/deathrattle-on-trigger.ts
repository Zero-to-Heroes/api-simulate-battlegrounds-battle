import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { FullGameState } from './internal-game-state';
import { onQuestProgressUpdated } from './quest';

export interface DeathrattleTriggeredInput {
	readonly boardWithDeadEntity: BoardEntity[];
	readonly boardWithDeadEntityHero: BgsPlayerEntity;
	readonly deadEntity: BoardEntity;
	readonly otherBoard: BoardEntity[];
	readonly otherBoardHero: BgsPlayerEntity;
	readonly gameState: FullGameState;
}

export const onDeathrattleTriggered = (input: DeathrattleTriggeredInput) => {
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
};
