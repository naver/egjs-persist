import utils from "../../src/utils";

// In case of IE8, TYPE_BACK_FORWARD is undefined.
describe("utils", function() {
    beforeEach(() => {
    });
    afterEach(() => {
    });

    // TODO: BACK 버튼으로 왔을 때 true 반환
    // TODO: FORWARD 버튼으로 왔을 때 true 반환
    // TODO: refresh 나, 주소쳐서 접근 시 false 반환
    // TODO: IE8 에서 스크립트 에러가 안나는지 테스트
    it("#isBackForwardNavigated", () => {
        // Given
        // When
        utils.isBackForwardNavigated();
        // Then
        expect(this.persist).to.be.exist;
    });
});