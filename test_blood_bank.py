from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

driver = webdriver.Chrome()
driver.maximize_window()

wait = WebDriverWait(driver, 10)

try:
    driver.get("http://localhost:8000/register.html")
    print("Blood Bank Registration Page opened")

    fields = [
        "fullName",
        "age",
        "gender",
        "bloodGroup",
        "email",
        "phone",
        "city",
        "availability",
        "password",
        "confirmPassword"
    ]

    for field in fields:
        element = wait.until(
            EC.visibility_of_element_located((By.ID, field))
        )
        assert element.is_displayed()
        time.sleep(1)

    print("Interface test passed")

    assert driver.find_element(
        By.ID, "fullName"
    ).get_attribute("placeholder") == "Enter your full name"

    time.sleep(1)

    assert driver.find_element(
        By.ID, "email"
    ).get_attribute("placeholder") == "your@email.com"

    time.sleep(1)

    assert driver.find_element(
        By.ID, "phone"
    ).get_attribute("placeholder") == "10-digit phone"

    time.sleep(1)

    print("Usability test passed")

    full_name = wait.until(
        EC.visibility_of_element_located((By.ID, "fullName"))
    )
    full_name.send_keys("Test Donor")
    time.sleep(1)

    age = driver.find_element(By.ID, "age")
    age.send_keys("25")
    time.sleep(1)

    gender = driver.find_element(By.ID, "gender")
    gender.send_keys("Male")
    time.sleep(1)

    blood_group = driver.find_element(By.ID, "bloodGroup")
    blood_group.send_keys("O+")
    time.sleep(1)

    email = driver.find_element(By.ID, "email")
    email.send_keys("testdonor@gmail.com")
    time.sleep(1)

    phone = driver.find_element(By.ID, "phone")
    phone.send_keys("9876543210")
    time.sleep(1)

    city = driver.find_element(By.ID, "city")
    city.send_keys("Chennai")
    time.sleep(1)

    availability = driver.find_element(By.ID, "availability")
    availability.send_keys("Available")
    time.sleep(1)

    password = driver.find_element(By.ID, "password")
    password.send_keys("test123")
    time.sleep(1)

    confirm_password = driver.find_element(By.ID, "confirmPassword")
    confirm_password.send_keys("test123")
    time.sleep(2)

    submit_button = wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, "button[type='submit']")
        )
    )

    driver.execute_script(
        "arguments[0].scrollIntoView({block: 'center'});",
        submit_button
    )

    time.sleep(2)

    wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "button[type='submit']")
        )
    )

    submit_button.click()

    time.sleep(3)

    print("Donor registration test executed")
    print("All test cases passed")

finally:
    time.sleep(2)
    driver.quit()