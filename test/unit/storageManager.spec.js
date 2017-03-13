import Persist from "../../src/persist";

describe("Persist init Test", function() {
    beforeEach(() => {
		  //this.inst = null;
    });
    afterEach(() => {
      // if(this.inst) {
      //   this.inst.destroy();
      //   this.inst = null;
      // }
    });
    
    it("reset", () => {
        // Given
        // When
        this.persist = Persist;
        // Then
        expect(this.persist).to.be.exist;
    });
});