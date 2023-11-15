import { TestBed } from "@angular/core/testing";

import { AnswerDoc, AnswerService } from "./answer.service";
import { of, throwError } from "rxjs";
import { SaveService } from "./save.service";

describe("AnswerService", () => {
  let service: AnswerService;

  const saveServiceSpy = jasmine.createSpyObj("SaveService", ["saveAnswers"]);

  const testId = "testId";

  const testAnswerDoc1: AnswerDoc = {
    id: testId,
    answers: ["TEST"],
    themeAnswers: { THEMETEST: [1] },
  };

  const testAnswerDoc2: AnswerDoc = {
    id: testId,
    answers: ["HELLO", "GOODBYE", "TEST"],
    themeAnswers: { THEME: [0, 2], ANSWER: [] },
  };

  beforeEach(() => {
    saveServiceSpy.saveAnswers.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [{ provide: SaveService, useValue: saveServiceSpy }],
    });
    service = TestBed.inject(AnswerService);

    service.answerBank.id = testId;
    service.answerBank.answers = ["HELLO", "GOODBYE", "TEST"];
    service.answerBank.themeAnswers = new Map<string, Array<number>>(Object.entries({ "THEME": [0, 2], "ANSWER": [] }));
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("activateAnswers", () => {
    it("add should populate answers with answer doc data", () => {
      service.activateAnswers(testAnswerDoc1);

      expect(service.answerBank.answers.length).toEqual(1);
      expect(service.answerBank.answers[0]).toEqual("TEST");
      expect(service.answerBank.themeAnswers.size).toEqual(1);
      expect(service.answerBank.themeAnswers.has("THEMETEST")).toEqual(true);
    });
  });

  describe("addAnswer", () => {
    it("add answer to themeAnswers when true", () => {
      service.addAnswer("some theme answer", true);

      expect(service.answerBank.themeAnswers.size).toEqual(3);
      expect(service.answerBank.themeAnswers.has("SOMETHEMEANSWER")).toEqual(true);
    });

    it("add answer to answers when false", () => {
      service.addAnswer("some answer", false);

      expect(service.answerBank.answers.length).toEqual(4);
      expect(service.answerBank.answers.includes("SOMEANSWER")).toEqual(true);
    });
  });

  describe("removeAnswer", () => {
    it("should remove answer from themeAnswers when true", () => {
      service.removeAnswer("theme", true);

      expect(service.answerBank.themeAnswers.size).toEqual(1);
      expect(service.answerBank.themeAnswers.has("THEME")).toEqual(false);
    });

    it("should remove answer from themeAnswers when false", () => {
      service.removeAnswer("HELLO", false);

      expect(service.answerBank.answers.length).toEqual(2);
      expect(service.answerBank.answers.includes("HELLO")).toEqual(false);
    });
  });

  describe("toggleCircle", () => {
    it("should remove circle if exists", () => {
      service.toggleCircle("theme", 2);

      expect(service.answerBank.themeAnswers.get("THEME")).toEqual([0]);
    });

    it("should add circle if doesn't exist", () => {
      service.toggleCircle("answer", 1);

      expect(service.answerBank.themeAnswers.get("ANSWER")).toEqual([1]);
    });
  });

  describe("clearAnswers", () => {
    it("should clear answer bank", () => {
      service.clearAnswers();

      expect(service.answerBank.id).toEqual(testId);
      expect(service.answerBank.themeAnswers.size).toEqual(0);
      expect(service.answerBank.answers.length).toEqual(0);
    });
  });

  describe("saveAnswers", () => {
    it("should save answers successfully", () => {
      service.saveAnswers().subscribe(() => {
        expect(saveServiceSpy.saveAnswers).toHaveBeenCalledWith(testAnswerDoc2);
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to set doc";
      saveServiceSpy.saveAnswers.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.saveAnswers().subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });
});
