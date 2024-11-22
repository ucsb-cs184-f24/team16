# System Architecture
## Diagram
![diagram updated](https://github.com/user-attachments/assets/e26719e1-6d8a-4b1d-85df-5a2c43caa252)

### Explanation

# Team Decisions
1. Calendar combining course times, assignments (based on due date) and personal events
2. Use [Puppeteer](https://pptr.dev/) to retrieve data from UCSB, Canvas, and Gradescope

# User Experience (UX) 
## User Flow
1. Entry
2. Log in through Firebase auth
3. Get the calendar (page showing the current time frame on the current date)
4. Select specific date to see
5. Select fields (in the filtering section) to be shown on the calendar
6. Select to see quarter info
7. Log out
