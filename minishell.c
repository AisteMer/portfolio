#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <limits.h>
#include <sys/wait.h>
#include <errno.h>
#include <signal.h>


#define BUFFER_SIZE 1024
#define BRIGHTBLUE "\x1b[34;1m"
#define DEFAULT    "\x1b[0m"

// Error Messages
#define ERROR_GETPSWDENT "Error: Cannot get passwd entry. %s.\n"
#define ERROR_CHDIR "Error: Cannot change directory to '%s'. %s.\n"
#define ERROR_TOO_MANY_ARGS "Error: Too many arguments to cd.\n"
#define ERROR_READ_STDIN "Error: Failed to read from stdin. %s.\n"
#define ERROR_FORK "Error: fork() failed. %s.\n"
#define ERROR_EXEC "Error: exec() failed. %s.\n"
#define ERROR_WAIT "Error: wait() failed. %s.\n"
#define ERROR_MALLOC "Error: malloc() failed. %s.\n"
#define ERROR_GETCWD "Error: Cannot get current working directory. %s.\n"
#define ERROR_SIGNAL "Error: Cannot register signal handler. %s.\n"
#define ERROR_STRDUP "Error: strndup() failed. %s.\n"
#define ERROR_GETENV "Error: getenv() failed. %s.\n"
#define ERROR_OPEN "Error: open() failed. %s.\n"
#define ERROR_CLOSE "Error: close() failed. %s.\n"
#define ERROR_READ "Error: read() failed. %s.\n"
#define ERROR_WRITE "Error: write() failed. %s.\n"
#define ERROR_FOPEN "Error: fopen() failed. %s.\n"
#define ERROR_FCLOSE "Error: fclose() failed. %s.\n"
#define ERROR_OPENDIR "Error: opendir() failed. %s.\n"
#define ERROR_READDIR "Error: readdir() failed. %s.\n"
#define ERROR_CLOSEDIR "Error: closedir() failed. %s.\n"
#define ERROR_SIGACTION "Error: sigaction() failed. %s.\n"
#define ERROR_SYSTEM "Error: system() failed. %s.\n"

volatile sig_atomic_t interrupted = 0;

//signal handler
void catch_signal(int sig) {
	interrupted = sig;
}


// Print Current Working Directory
void print_cwd(void) {
    char cwd[PATH_MAX];
    if (getcwd(cwd, sizeof(cwd)) == NULL) {
        fprintf(stderr, ERROR_GETCWD, strerror(errno));
        exit(EXIT_FAILURE);
    }
    printf("%s[%s]$ %s", BRIGHTBLUE, cwd, DEFAULT);
    fflush(stdout);
}

// Read User Input
void read_user_input(char *buffer) {
	if (fgets(buffer, BUFFER_SIZE, stdin) == NULL) {
		if (errno == EINTR) {
			if (interrupted) {
				printf("\n");
				interrupted = 0;
				return;
			}
		} else {
			fprintf(stderr, ERROR_READ_STDIN, strerror(errno));
			exit(EXIT_FAILURE);
		} 
	}
	buffer[strcspn(buffer, "\n")] = '\0';
}

// Execute User Command
void execute_user_input(const char *command) {
	pid_t pid = fork();
	int arg_count = 0;
	char *arguments[2048]; //max number of tokens
	char *command_string = strdup(command);

	if (pid == -1) {
		fprintf(stderr, ERROR_FORK, strerror(errno));
		exit(EXIT_FAILURE);
	} else if (pid == 0) { //in the child
		if (command_string == NULL) {
			fprintf(stderr, ERROR_MALLOC, strerror(errno));
			exit(EXIT_FAILURE);
		}
		char *token = strtok(command_string, " ");
		while (token != NULL && arg_count < 2047) {
			arguments[arg_count++] = token;
			token = strtok(NULL, " ");
		}
		arguments[arg_count] = NULL;

        if (arg_count > 0) {
            execvp(arguments[0], arguments);

            // exec() failed
            fprintf(stderr, ERROR_EXEC, strerror(errno));
            exit(EXIT_FAILURE);
        }

        free(command_string); // freeing the command string, because it was duplicated

	} else {
		free(command_string); //not sure if we need to free it here as well? because I now declared it in the method, not just the if statement
		int status;
		if (waitpid(pid, &status, 0) == -1) {
			if (errno != EINTR) {
				fprintf(stderr, ERROR_WAIT, strerror(errno));
				exit(EXIT_FAILURE);
			}
		}
	}
}

// cd Command Function
void change_directory(int argc, char **argv) {
	const char *home_directory = getenv("HOME");

	if (home_directory == NULL) {
		fprintf(stderr, ERROR_GETENV, strerror(errno));
		return;
	}


	if (argc == 1 || (argc == 2 && strcmp(argv[1], "~") == 0)) {
		if (chdir(home_directory) == -1) {
			fprintf(stderr, ERROR_CHDIR, home_directory, strerror(errno));
			exit(EXIT_FAILURE);	
		}
	} else if (argc == 2) {
		char *path = argv[1];
		int len = strlen(path);
		
		//paths that begin with ~
		if (path[0] == '~') {
			char full_path[PATH_MAX];
			snprintf(full_path, sizeof(full_path), "%s%s", home_directory, path+1);
			if (chdir(full_path) == -1) {
				fprintf(stderr, ERROR_CHDIR, full_path, strerror(errno));
				exit(EXIT_FAILURE);
			}
		} else if (path[0] == '"' && path[len - 1] == '"') {
			path[len-1] = '\0';
			path++;
			if (chdir(path) == -1) {
				fprintf(stderr, ERROR_CHDIR, path, strerror(errno));
				exit(EXIT_FAILURE);
			}
			
		} else if (path[0] == '"' && path[len - 1] != '"') {
			fprintf(stderr, "Error: missing closing quote in directory name.\n");
			exit(EXIT_FAILURE);
		} else {
			if (chdir(path) == -1) {
				fprintf(stderr, ERROR_CHDIR, path, strerror(errno));
				exit(EXIT_FAILURE);;
			}
		}
	} else {
		fprintf(stderr, ERROR_TOO_MANY_ARGS);
		exit(EXIT_FAILURE);
	}

}

// exit Command Function
void exit_shell(void) {
    printf("Exiting shell\n");
    exit(EXIT_SUCCESS);
}

int main(int argc, char **argv) {
	struct sigaction action;
	memset(&action, 0, sizeof(struct sigaction));
	action.sa_handler = catch_signal;
	sigemptyset(&action.sa_mask);
	action.sa_flags = 0;
	

	if (sigaction(SIGINT, &action, NULL) == -1) {
		fprintf(stderr, ERROR_SIGACTION, strerror(errno));
		exit(EXIT_FAILURE);
	}

	char user_command[BUFFER_SIZE];

	while (1) {
		if (interrupted) {
			printf("\n");
			interrupted = 0; //reset the volatile variable
			continue;
		}
        	print_cwd();
        	read_user_input(user_command);

        	// No User Input
        	if (strlen(user_command) == 0) {
            		continue;
        	}

        	// Handle cd Command
        	if (strncmp(user_command, "cd", 2) == 0 && (user_command[2] == ' ' || user_command[2] == '\0')) {
            		char *path;
            		if (user_command[2] == '\0') {
                		path = NULL;
            		} else {
                		path = strdup(user_command + 3); //copying the path to allocate some memory
				if (path == NULL) {
				fprintf(stderr, ERROR_MALLOC, strerror(errno));
				continue;
			}
            	}
		char *args[] = {"cd", path, NULL};
		change_directory(path? 2: 1, args);
		if (path != NULL) {
			free(path);
		}
		continue;
        }
	
	// Handle exit Command
	if (strcmp(user_command, "exit") == 0) {
		exit_shell();
	}
	// Execute Other Commands
	execute_user_input(user_command);
	}
	
	return EXIT_SUCCESS;
}
