var app = angular.module('PuzzleHuntApp', []);

app.controller('AppController', ['$scope', '$http', function($scope, $http) {
    $scope.page = {
        PUZZLES : 1,
        SUBMISSIONS : 2,
        LEADERBOARD : 3,
        TEAM : 4
    };

    $scope.teamState = {
        NO_TEAM : 1,
        CREATE_TEAM : 2,
        LEAVE_TEAM : 3,
        JOIN_TEAM : 4,
        TEAM : 5
    };

    $scope.currentPage = 0;
    $scope.currentTeamState = $scope.teamState.NO_TEAM;

    $scope.problemAnswer = "";
    $scope.submitting = false;
    $scope.submitted = false;

    $scope.teamErrorMsg = "";
    $scope.puzzleErrorMsg = "";
    $scope.puzzleAnsErrorMsg = "";
    $scope.submissionsGetError = "";

    $scope.user = null;
    $scope.team = null;
    $scope.puzzles = [];
    $scope.submissions = [];
    $scope.leaderboard = null;

    $scope.lastUpdatedLeaderboard = null;
    $scope.loadingLeaderboard = false;

    $scope.selectedPuzzle = -1;

    $scope.changePage = function(page) {
        $scope.currentPage = page;
        if (page === $scope.page.PUZZLES)
            $scope.getPuzzles();
        if (page === $scope.page.SUBMISSIONS)
            $scope.getSubmissions();
        if (page === $scope.page.LEADERBOARD)
            $scope.getLeaderboard();
        if (page === $scope.page.TEAM)
            $scope.getTeam();
    };

    $scope.changeTeamState = function(state) {
        $scope.currentTeamState = state;
        $scope.teamErrorMsg = "";
    }
    
    $scope.getUser = function() {
        $http.get('/user').then(function(response) {
            if (!response || response.status != 200 || !response.data.user)
                throw "Invalid response";
            $scope.user = response.data.user;
        }).catch(function(err) {
            window.location.href = "/";
        });
    };

    $scope.getTeam = function() {
        $http.get('/team').then(function(response) {
            if (!response || response.status != 200)
                throw "Invalid response";
            if (!response.data.team || response.err)
                throw response.err;
            $scope.team = response.data.team;
            $scope.changeTeamState($scope.teamState.TEAM);
        }).catch(function(err) {
            $scope.team = null;
            $scope.changeTeamState($scope.teamState.NO_TEAM);
        });
    };

    $scope.getPuzzles = function() {
        $http.get('/puzzle').then(function(response) {
            if (!response || response.status != 200)
                throw "Invalid response";
            if (response.data.error)
                throw response.data.error;

            $scope.puzzleErrorMsg = "";
            $scope.puzzles = response.data.puzzles.sort((a, b) => {
                if (a.shortcode < b.shortcode) return -1;
                if (a.shortcode > b.shortcode) return 1;
                return 0;
            });
        }).catch(function(err) {
            $scope.puzzles = [];
            $scope.puzzleErrorMsg = err;
        });
    };

    $scope.getSubmissions = function() {
        $http.get('/submission').then(function(response) {
            if (!response || response.status != 200)
                throw "Invalid response";
            if (response.data.error)
                throw response.data.error;

            $scope.submissions = response.data.submissions.map(function(submission) {
                submission.timestamp = (new Date(submission.timestamp)).toLocaleString();
                return submission;
            }).sort((a, b) => {
                if (a.timestamp > b.timestamp) return -1;
                if (a.timestamp < b.timestamp) return 1;
                return 0;
            });
        }).catch(function(err) {
            $scope.submissionsGetError = err;
            $scope.submissions = [];
        });
    };

    $scope.getLeaderboard = function() {
        if ($scope.loadingLeaderboard)
            return;
        $scope.loadingLeaderboard = true;
        $http.get('/leaderboard').then(function(response) {
            if (!response || response.status != 200)
                throw "Invalid response";
            if (response.data.error)
                throw response.data.error;

            $scope.leaderboard = response.data.leaderboard;
            $scope.lastUpdatedLeaderboard = (new Date()).toLocaleString();
            $scope.loadingLeaderboard = false;
        }).catch(function(err) {
            $scope.loadingLeaderboard = false;
        });
    }

    $scope.createTeam = function(name) {
        $http.post('/team/create', { team: { name: name } }).then(function(response) {
            if (!response || response.status != 200)
                throw "Invalid response";
            if (response.data.error)
                throw response.data.error;
            $scope.team = response.data.team;
            $scope.changeTeamState($scope.teamState.TEAM);
        }).catch(function(err) {
            $scope.teamErrorMsg = err;
        });
    };

    $scope.joinTeam = function(id) {
        $http.post('/team/join', { team: { id: id } }).then(function(response) {
            if (!response || response.status != 200)
                throw "Invalid response";
            if (response.data.error)
                throw response.data.error;
            $scope.team = response.data.team;
            $scope.changeTeamState($scope.teamState.TEAM);
        }).catch(function(err) {
            $scope.teamErrorMsg = err;
        });
    };

    $scope.leaveTeam = function() {
        $http.post('/team/leave').then(function(response) {
            if (!response || response.status != 200)
                throw "Invalid response";
            if (response.data.error)
                throw response.data.error;
            $scope.team = null;
            $scope.changeTeamState($scope.teamState.NO_TEAM);
        }).catch(function(err) {
            $scope.teamErrorMsg = err;
        });
    };

    $scope.submitAnswer = function(puzzle, answer) {
        if (puzzle > -1) {
            $scope.submitting = true;
            $http.post('/submission', { submission: { puzzleId: $scope.puzzles[puzzle].id, answer: answer }}).then(function(response) {
                if (!response || response.status !== 200)
                    throw "Invalid response";
                if (response.data.error)
                    throw response.data.error;
                document.getElementById('answer-input').value = "";
                $scope.submitting = false;
                $scope.submitted = true;
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.submitted = false;
                    });
                }, 2000);
            }).catch(function(err) {
                $scope.puzzleAnsErrorMsg = err;
            });
        }
    };

    $scope.getUser();
    $scope.getTeam();
    $scope.changePage($scope.page.PUZZLES);
}]);