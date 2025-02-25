/* eslint-disable @typescript-eslint/no-use-before-define */
import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { FullGameState } from '../internal-game-state';
import { applyAfterStatsUpdate } from '../stats';
import { StartOfCombatPhase } from './phases';
import { handleStartOfCombatAnomalies } from './soc-anomalies';
import { handleStartOfCombatHeroPowers } from './soc-hero-power';
import { handleIllidanHeroPowers } from './soc-illidan-hero-power';
import { handleStartOfCombatMinions } from './soc-minion';
import { handlePreCombatHeroPowers } from './soc-pre-combat-hero-power';
import { handleStartOfCombatQuestRewards } from './soc-quest-reward';
import { handleStartOfCombatSecrets } from './soc-secret';
import { handleStartOfCombatTrinkets } from './soc-trinket';

// TODO 20/04/2024: I'm not too sure about some ordering. The way I understand it, the Start of Combat has
// multiple phases, and in each phase the player order is random
// However, looking at http://replays.firestoneapp.com/?reviewId=a577602e-06f3-4c4b-928d-36ea98c2e6d5&turn=5&action=0,
// it feels that a "start of combat" minion effect could trigger before an opponent's hero power effect
// Or is that limited to Bru'kan?
// I feel that I've asked a lot of questions recently, so I don't want to add that one to the list, as the interaction
// is for now pretty marginal
export const handleStartOfCombat = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	const shouldRecomputeCurrentAttacker = true;
	if (shouldRecomputeCurrentAttacker) {
		currentAttacker =
			playerBoard.length > opponentBoard.length
				? 0
				: opponentBoard.length > playerBoard.length
				? 1
				: Math.round(Math.random());
	}

	// UPDATE 2024-10-10: changed in 30.6, according to a message from Mitchell on Discord
	const phases: readonly StartOfCombatPhase[] = [
		'QuestReward',
		'Anomalies',
		'Trinket',
		// https://twitter.com/DCalkosz/status/1488361384320528388?s=20&t=1ECxRZFdjqwEa2fRsXk32Q
		// There’s a certain order for Start of Combat hero powers, rather than “coin flips” where
		// an unlucky trigger order could mess up some positioning you had planned for your own hero
		// power. “Precombat” (Al’Akir, Y’Shaarj), then Illidan, then others.
		// Update: this seems to have changed: https://x.com/LoewenMitchell/status/1737588920139825335?s=20
		// now you have all hero powers trigger in a first phase, then you have Illidan, and once everything has triggered, you have Tavish
		'PreCombatHeroPower',
		'IllidanHeroPower',
		'HeroPower',
		'Secret',
		'Minion',
	];
	let playerBoardBefore = playerBoard.map((e) => ({ ...e }));
	let opponentBoardBefore = opponentBoard.map((e) => ({ ...e }));
	for (const phase of phases) {
		currentAttacker = handlePhase(
			phase,
			playerEntity,
			playerBoard,
			playerBoardBefore,
			opponentEntity,
			opponentBoard,
			opponentBoardBefore,
			currentAttacker,
			gameState,
		);
		if (phase === 'PreCombatHeroPower') {
			playerBoardBefore = playerBoard.map((e) => ({ ...e }));
			opponentBoardBefore = opponentBoard.map((e) => ({ ...e }));
		}
	}
	playerEntity.startOfCombatDone = true;
	opponentEntity.startOfCombatDone = true;
	applyAfterStatsUpdate(gameState);
	return currentAttacker;
};

const handlePhase = (
	phase: StartOfCombatPhase,
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	playerBoardBefore: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentBoardBefore: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	switch (phase) {
		case 'QuestReward':
			return handleStartOfCombatQuestRewards(
				playerEntity,
				playerBoard,
				opponentEntity,
				opponentBoard,
				currentAttacker,
				gameState,
			);
		case 'Anomalies':
			return handleStartOfCombatAnomalies(
				playerEntity,
				playerBoard,
				opponentEntity,
				opponentBoard,
				currentAttacker,
				gameState,
			);
		case 'Trinket':
			return handleStartOfCombatTrinkets(
				playerEntity,
				playerBoard,
				opponentEntity,
				opponentBoard,
				currentAttacker,
				gameState,
			);
		case 'PreCombatHeroPower':
			return handlePreCombatHeroPowers(
				playerEntity,
				playerBoard,
				opponentEntity,
				opponentBoard,
				currentAttacker,
				gameState,
			);
		case 'IllidanHeroPower':
			return handleIllidanHeroPowers(
				playerEntity,
				playerBoard,
				opponentEntity,
				opponentBoard,
				currentAttacker,
				gameState,
			);
		case 'HeroPower':
			return handleStartOfCombatHeroPowers(
				playerEntity,
				playerBoard,
				opponentEntity,
				opponentBoard,
				currentAttacker,
				gameState,
			);
		case 'Secret':
			return handleStartOfCombatSecrets(
				playerEntity,
				playerBoard,
				opponentEntity,
				opponentBoard,
				currentAttacker,
				gameState,
			);
		case 'Minion':
			return handleStartOfCombatMinions(
				playerEntity,
				playerBoard,
				opponentEntity,
				opponentBoard,
				currentAttacker,
				playerBoardBefore,
				opponentBoardBefore,
				gameState,
			);
	}
};
