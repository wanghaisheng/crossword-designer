import { TestBed } from "@angular/core/testing";

import { LoadService } from "./load.service";
import { PuzzleDoc, PuzzleService } from "./puzzle.service";
import { of, throwError } from "rxjs";
import { FirebaseService } from "./firebase.service";
import { DocumentData, DocumentReference, Query, QueryDocumentSnapshot, QuerySnapshot, SnapshotMetadata } from "@angular/fire/firestore";
import { AnswerDoc, AnswerService } from "./answer.service";

describe("LoadService", () => {
  let service: LoadService;

  const firebaseServiceSpy = jasmine.createSpyObj("FirebaseService", ["addDoc", "setDoc", "getDoc", "getDocs"]);
  const answerServiceSpy = jasmine.createSpyObj("AnswerService", ["activateAnswerBank"]);
  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["activatePuzzle"]);

  const testId = "testId";

  const newAnswerBank: AnswerDoc = {
    id: "",
    answers: [],
    themeAnswers: {},
  };

  beforeEach(() => {
    firebaseServiceSpy.addDoc.and.returnValue(of({ id: testId } as DocumentReference));
    firebaseServiceSpy.setDoc.and.returnValue(of(undefined));
    firebaseServiceSpy.getDocs.and.returnValue(
      of({
        docs: [
          {
            id: "testId1",
            data: () => {
              return { name: "Test 1" } as DocumentData;
            },
          } as QueryDocumentSnapshot,
          {
            id: "testId2",
            data: () => {
              return { name: "Test 2" } as DocumentData;
            },
          } as QueryDocumentSnapshot,
        ],
        metadata: {} as SnapshotMetadata,
        query: {} as Query,
        size: 3,
        empty: false,
        forEach: () => {},
        docChanges: () => {
          return [];
        },
      } as QuerySnapshot)
    );

    TestBed.configureTestingModule({
      providers: [
        { provide: FirebaseService, useValue: firebaseServiceSpy },
        { provide: AnswerService, useValue: answerServiceSpy },
        { provide: PuzzleService, useValue: puzzleServiceSpy },
      ],
    });
    service = TestBed.inject(LoadService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getPuzzleList", () => {
    it("should return data when successful", () => {
      service.getPuzzleList().subscribe((result) => {
        expect(result).toEqual([{ name: "Test 1", id: "testId1" } as PuzzleDoc, { name: "Test 2", id: "testId2" } as PuzzleDoc]);
      });
    });

    it("should return throw error when unsuccessful", () => {
      const errorMsg = "Failed to get docs";
      firebaseServiceSpy.getDocs.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.getPuzzleList().subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("setActiveId", () => {
    it("should emit new active id", () => {
      service.setActiveId("testId");

      service.activePuzzleId$.subscribe((id) => {
        expect(id).toEqual("testId");
      });

      service.activePuzzleId$.unsubscribe();
    });
  });

  describe("createPuzzle", () => {
    it("should return true when successful", () => {
      service.createPuzzle("Test Puzzle", 10, 12).subscribe((result: boolean) => {
        expect(firebaseServiceSpy.addDoc).toHaveBeenCalled();
        expect(firebaseServiceSpy.setDoc).toHaveBeenCalledWith("answers", testId, newAnswerBank);
        expect(result).toEqual(true);
      });
    });

    it("should return false when unsuccessful", () => {
      firebaseServiceSpy.addDoc.and.callFake(() => {
        return throwError(new Error("Failed to add doc"));
      });

      service.createPuzzle(testId, 10, 12).subscribe((result: boolean) => {
        expect(result).toEqual(false);
      });
    });
  });
});
