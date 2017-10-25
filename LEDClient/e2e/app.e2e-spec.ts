import { LEDClientPage } from './app.po';

describe('ledclient App', () => {
  let page: LEDClientPage;

  beforeEach(() => {
    page = new LEDClientPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
