import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickMultipleRandomAlive } from '../services/utils';
import { getEffectiveTribesForEntity, hasCorrectTribe } from '../utils';
import { updateAvengeCounters } from './avenge';
import { addCardsInHand } from './cards-in-hand';
import { handleWheneverMinionsKillEffect } from './deathrattle-effects';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { onQuestProgressUpdated } from './quest';
import { removeMinionFromBoard } from './remove-minion-from-board';
import { performEntitySpawns } from './spawns';
import { modifyStats } from './stats';

export const makeMinionsDie = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): [number[], number[], BoardEntity[]] => {
	// Because entities spawn to the left, so the right index is unchanged
	const deadMinionIndexesFromLeft: number[] = [];
	const deadMinionIndexesFromRight: number[] = [];
	const deadEntities: BoardEntity[] = [];
	const initialBoardLength = board.length;

	handleWheneverMinionsKillEffect(board, boardHero, otherBoard, otherBoardHero, gameState);
	for (let i = 0; i < board.length; i++) {
		if (board[i].health <= 0 || board[i].definitelyDead) {
			deadMinionIndexesFromLeft.push(i);
			deadMinionIndexesFromRight.push(initialBoardLength - (i + 1));
			deadEntities.push(board[i]);
			// console.log(
			// 	'\tflagging dead minion 0',
			// 	stringifySimpleCard(board[i], allCards),
			// 	stringifySimple(board, allCards),
			// 	initialBoardLength,
			// 	i,
			// 	deadMinionIndexesFromRight,
			// );
		}
	}

	// These will always be processed from left to right afterwards
	// We compute the indexes as they will be once the new board is effective. For a
	// board of length N, having an indexFromRight at N means it will spawn at the very left
	// of the board (first minion)
	let indexesFromRightAfterDeath = [];
	for (let i = deadMinionIndexesFromRight.length - 1; i >= 0; i--) {
		const newIndex = deadMinionIndexesFromRight[i] - indexesFromRightAfterDeath.length;
		indexesFromRightAfterDeath.push(newIndex);
	}
	indexesFromRightAfterDeath = indexesFromRightAfterDeath.reverse();

	for (let i = 0; i < board.length; i++) {
		if (board[i].health <= 0 || board[i].definitelyDead) {
			// console.log('\tflagging dead minion', stringifySimpleCard(board[i], allCards), deadMinionIndexesFromRight);
			removeMinionFromBoard(board, boardHero, i, gameState);
			// We modify the original array, so we need to update teh current index accordingly
			i--;
		}
	}

	// console.debug('dead entities', stringifySimple(deadEntities, allCards));
	// Update the avenge counters as soon as minions die. If we wait until the "avenge" phase, we might
	// update the counters for entities that have been spawned after the death of the original entity
	// ISSUE: deaths are actually processed one by one. Once a minion dies, its DR triggers, then the next, etc.
	// This means that if you have a minion that summons another one, it can progress and complete and quest
	// and the next minion dying could count towards that quest progress
	// See http://replays.firestoneapp.com/?reviewId=0ce4db9c-3269-4704-b662-8a8c31f5afe1&turn=16&action=27
	for (const deadEntity of deadEntities) {
		const indexFromRight = indexesFromRightAfterDeath[deadEntities.indexOf(deadEntity)];
		updateAvengeCounters(board, boardHero);
		onMinionDeadHeroPower(board, boardHero, deadEntity, gameState);
		onMinionDeadHeroPower(otherBoard, otherBoardHero, deadEntity, gameState);
		onMinionDeadQuest(deadEntity, indexFromRight, board, boardHero, otherBoard, otherBoardHero, gameState);
		onMinionDeadQuest(deadEntity, indexFromRight, otherBoard, otherBoardHero, board, boardHero, gameState);
	}

	return [deadMinionIndexesFromLeft, indexesFromRightAfterDeath, deadEntities];
};

export const onMinionDeadHeroPower = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	gameState: FullGameState,
) => {
	for (const heroPower of boardHero.heroPowers) {
		if (
			heroPower.cardId === CardIds.IllTakeThat &&
			heroPower.used &&
			heroPower.info2 <= 0 &&
			deadEntity.friendly !== boardHero.friendly
		) {
			addCardsInHand(boardHero, board, [deadEntity.cardId], gameState);
			heroPower.info2 = 1;
		}
	}
};

export const onMinionDeadQuest = (
	deadEntity: BoardEntity,
	indexFromRight: number,
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const quests = boardHero.questEntities ?? [];
	for (const quest of quests) {
		switch (quest.CardId) {
			case CardIds.ReenactTheMurder:
				if (deadEntity.friendly === boardHero.friendly) {
					onQuestProgressUpdated(boardHero, quest, board, gameState);
				}
				break;
			case CardIds.RoundUpTheSuspects:
				if (deadEntity.friendly !== boardHero.friendly) {
					onQuestProgressUpdated(boardHero, quest, board, gameState);
				}
				break;
		}
	}

	for (const trinket of boardHero.trinkets) {
		switch (trinket.cardId) {
			case CardIds.AllianceKeychain_BG30_MagicItem_433:
			case CardIds.AllianceKeychain_AllianceKeychainToken_BG30_MagicItem_433t:
				if (trinket.scriptDataNum1 > 0 && deadEntity.friendly === boardHero.friendly) {
					const quantity = trinket.cardId === CardIds.AllianceKeychain_BG30_MagicItem_433 ? 1 : 2;
					const targets = pickMultipleRandomAlive(board, quantity);
					for (const target of targets) {
						modifyStats(target, deadEntity.maxAttack, deadEntity.maxHealth, board, boardHero, gameState);
						gameState.spectator.registerPowerTarget(boardHero, target, board, boardHero, otherBoardHero);
					}
					trinket.scriptDataNum1--;
				}
				break;
			case CardIds.TheEyeOfDalaran_BG30_MagicItem_981:
				if (
					deadEntity.friendly === boardHero.friendly &&
					getEffectiveTribesForEntity(deadEntity, boardHero, gameState.anomalies, gameState.allCards)
						.length === 0
				) {
					addCardsInHand(boardHero, board, [null], gameState);
				}
				break;
			case CardIds.BloodGolemSticker_BG30_MagicItem_442:
				if (
					deadEntity.friendly === boardHero.friendly &&
					trinket.scriptDataNum1 > 0 &&
					hasCorrectTribe(deadEntity, boardHero, Race.QUILBOAR, gameState.anomalies, gameState.allCards)
				) {
					let bloodGemEnchantments = deadEntity.enchantments?.filter(
						(e) => e.cardId === CardIds.BloodGem_BloodGemsEnchantment,
					);
					if (bloodGemEnchantments?.length === 0) {
						bloodGemEnchantments = deadEntity.enchantments?.filter(
							(e) => e.cardId === CardIds.BloodGem_BloodGemEnchantment,
						);
					}
					if (bloodGemEnchantments?.length > 0) {
						const bloodGemAttack = bloodGemEnchantments
							.map((e) => e.tagScriptDataNum1 ?? 0)
							.reduce((a, b) => a + b, 0);
						const bloodGemHealth = bloodGemEnchantments
							.map((e) => e.tagScriptDataNum2 ?? 0)
							.reduce((a, b) => a + b, 0);
						if (bloodGemAttack > 0 || bloodGemHealth > 0) {
							const spawns = spawnEntities(
								CardIds.BloodGolemSticker_BloodGolemToken_BG30_MagicItem_442t,
								1,
								board,
								boardHero,
								otherBoard,
								otherBoardHero,
								gameState,
								deadEntity.friendly,
								false,
							);
							spawns.forEach((b) => {
								b.attack = bloodGemAttack;
								b.health = bloodGemHealth;
							});
							performEntitySpawns(
								spawns,
								board,
								boardHero,
								deadEntity,
								indexFromRight,
								otherBoard,
								otherBoardHero,
								gameState,
							);
							trinket.scriptDataNum1--;
						}
					}
				}
				break;
		}
	}
};
