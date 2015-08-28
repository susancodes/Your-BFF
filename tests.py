from selenium import webdriver
import unittest

class TestCalculator(unittest.TestCase):

    def setUp(self):
        self.browser = webdriver.Firefox()

    def tearDown(self):
        self.browser.quit()

    def test_title(self):
        self.browser.get('http://localhost:5000/')
        self.assertEqual(self.browser.title, "Your BFF")

    def test_form(self):
        self.browser.get('http://localhost:5000/')

        airportcodes = self.browser.find_element_by_id('airportcodes')
        airportcodes.send_keys("SFO")

        early_depart = self.browser.find_element_by_id('early-depart')
        early_depart.send_keys("2015-09-09")

        late_depart = self.browser.find_element_by_id('late-depart')
        late_depart.send_keys("2015-09-19")

        length = self.browser.find_element_by_id('length-of-stay')
        length.send_keys("3")

        budget = self.browser.find_element_by_id('max-budget')
        budget.send_keys("500")

        btn = self.browser.find_element_by_id('form-submit')
        btn.click()

        # result = self.browser.find_element_by_id('over-map-box')
        # self.assertEqual(result.text, "Have a safe flight!")


if __name__ == "__main__":
    unittest.main()