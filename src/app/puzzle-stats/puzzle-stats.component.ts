import { Component, OnInit } from "@angular/core";
import { Clue, PuzzleService, SquareType } from "../services/puzzle.service";
import { Card, Status, Type } from "../components/metric-group/metric-group.component";

interface Metric {
  name: string;
  value: any;
  type: Type;
  progress?: number;
  status?: Status;
}

@Component({
  selector: "app-puzzle-stats",
  templateUrl: "./puzzle-stats.component.html",
  styleUrls: ["./puzzle-stats.component.scss"],
})
export class PuzzleStatsComponent implements OnInit {
  public metrics: Array<Metric> = [];
  public metricCards: Array<Card> = [];

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {
    if (this.puzzleService.puzzle) {
      this.calcGridMetrics();
      this.calcWordMetrics();

      this.buildMetricCards();
    }
  }

  private calcGridMetrics(): void {
    const puzzle = this.puzzleService.puzzle;
    let symmetrical = true;
    let spacerCount = 0;

    this.calcConnectivity();
    puzzle.grid.forEach((square) => {
      if (square.type == SquareType.Spacer) {
        const reflect = puzzle.grid[this.puzzleService.getReflectIndex(square.index)];
        if (reflect.type != SquareType.Spacer) {
          symmetrical = false;
        }

        spacerCount++;
      }
    });

    const spacerFreq = spacerCount / puzzle.grid.length;

    this.metrics.push({ name: "Symmetrical", value: symmetrical, type: Type.Check });
    this.metrics.push({
      name: "White Square Frequency",
      value: 1 - spacerFreq,
      type: Type.Percent,
      progress: 1 - spacerFreq,
      status: spacerFreq > 0.5 ? Status.Danger : spacerFreq > 0.2 ? Status.Warning : Status.Success,
    });
  }

  private calcWordMetrics(): void {
    const puzzle = this.puzzleService.puzzle;

    let duplicateCount = 0;
    let wordLengthSum = 0;
    let minWordLength = 100;
    let words: Array<string> = [];

    puzzle.acrossClues.concat(puzzle.downClues).forEach((clue: Clue) => {
      wordLengthSum += clue.squares.length;

      if (clue.answer.trim().length != 0) {
        if (!words.includes(clue.answer)) {
          words.push(clue.answer);
        } else {
          duplicateCount++;
        }
      }

      if (clue.squares.length < minWordLength) {
        minWordLength = clue.answer.length;
      }
    });

    const avgWordLength = wordLengthSum / (puzzle.acrossClues.length + puzzle.downClues.length);
    const puzzleMinDim = Math.min(puzzle.width, puzzle.height);
    const puzzleMaxDim = Math.max(puzzle.width, puzzle.height);

    this.metrics.push({
      name: "No Duplicate Words",
      value: duplicateCount == 0,
      type: Type.Check,
    });
    this.metrics.push({
      name: "Minimum Word Length",
      value: minWordLength,
      type: Type.Number,
      progress: minWordLength / puzzleMinDim,
      status: minWordLength < 2 ? Status.Danger : minWordLength < 3 ? Status.Warning : Status.Success,
    });
    this.metrics.push({
      name: "Average Word Length",
      value: avgWordLength,
      type: Type.Number,
      progress: avgWordLength / puzzleMaxDim,
      status: avgWordLength < 0.1 * puzzleMaxDim ? Status.Danger : avgWordLength < 0.2 * puzzleMaxDim ? Status.Warning : Status.Success,
    });
  }

  private calcConnectivity(): void {
    const puzzle = this.puzzleService.puzzle;
    const connected = this.connected([this.puzzleService.getFirstLetterIndex()], []);
    const letters = puzzle.grid.filter((s) => s.type == SquareType.Letter);

    this.metrics.push({ name: "Connected", value: connected.length == letters.length, type: Type.Check });
  }

  /**
   * Behold a beautiful recursive function! Thanks EECS 281
   * @param indeces indeces to check
   * @param touched connected indeces
   * @returns connected indeces
   */
  private connected(indeces: Array<number>, touched: Array<number>): Array<number> {
    if (indeces.length == 0) {
      return touched;
    } else {
      const puzzle = this.puzzleService.puzzle;

      let acrossSquares = puzzle.acrossClues.find((c) => puzzle.grid[indeces[0]].acrossClueNum == c.num)?.squares || [];
      let downSquares = puzzle.downClues.find((c) => puzzle.grid[indeces[0]].downClueNum == c.num)?.squares || [];
      let allSquares = acrossSquares.concat(downSquares);

      indeces = indeces.concat(allSquares.filter((s) => !indeces.includes(s) && !touched.includes(s)));
      touched = touched.concat(indeces.filter((s) => !touched.includes(s)));

      indeces.shift();

      return this.connected(indeces, touched);
    }
  }

  private buildMetricCards(): void {
    this.metricCards = this.metrics.map((metric: Metric) => {
      return {
        id: metric.name.toLowerCase().split(" ").join("-"),
        title: metric.name,
        metricType: metric.type,
        value: metric.value,
        progress: metric.progress,
        status: metric.status ? metric.status : Status.None,
      };
    });
  }
}
