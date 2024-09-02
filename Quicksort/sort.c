#include <errno.h>
#include <getopt.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "quicksort.h"

#define MAX_STRLEN     64 // Not including '\0'
#define MAX_ELEMENTS 1024

int main(int argc, char **argv) {

    int opt;
    opterr = 0;
    int sorting_method = 0;
    int flagCount = 0;
    char *filename = NULL;
    char buffer[MAX_STRLEN];

    while ((opt = getopt(argc, argv, "id")) != -1){
        switch(opt){
            case 'i':
                sorting_method = 1;
                flagCount++;
                break;

            case 'd':
                sorting_method = 2;
                flagCount++;
                break;

            //Error: Invalid Flag
            default:
                printf("Error: Unknown option '-%c' received.\n", optopt);
                printf("Usage: ./sort [-i|-d] [filename]\n");
                printf("   -i: Specifies the input contains ints.\n");
                printf("   -d: Specifies the input contains doubles.\n");
                printf("   filename: The file to sort. If no file is supplied, input is read from\n");
                printf("             stdin.\n");
                printf("   No flags defaults to sorting strings.\n");
                return EXIT_FAILURE;
        }
    }

    //Error: Too Many Flags
    if(flagCount > 1){
        fprintf(stderr, "Error: Too many flags specified.\n");
        return EXIT_FAILURE;
    }

    if(sorting_method == 0){
        sorting_method = 3;
    }

    //Error: Multiple File Names
    if (optind < argc - 1){
      	fprintf(stderr, "Error: Too many files specified.\n");
        return EXIT_FAILURE;
    }

    //Locate Filename
    if(optind < argc){
        filename = argv[optind];
    }

    //Read Filename and Open
    FILE *input_str = stdin;
    if(filename != NULL){
        input_str = fopen(filename, "r");

        //Error: Input File is NULL
        if(input_str == NULL){
            fprintf(stderr, "Error: Cannot open '%s'. %s.\n", filename, strerror(errno));
            return EXIT_FAILURE;
        }
    }

    //Allocate Memory
    char **data = (char **) malloc(MAX_ELEMENTS * sizeof(char *));
    if(data == NULL){
        fprintf(stderr, "Error: Memory allocation failed.\n");
        return EXIT_FAILURE;
    }

    //Read Input File or from Standard Input
    size_t num_elements = 0;

    while(fgets(buffer, sizeof(buffer), input_str) && num_elements < MAX_ELEMENTS){
        buffer[strcspn(buffer, "\n")] = '\0';
        data[num_elements] = strdup(buffer);

        if(data[num_elements] == NULL){
            fprintf(stderr, "Error: Memory allocation failed.\n");
            return EXIT_FAILURE;
        }
        num_elements++;
    }

    if(filename != NULL){
        fclose(input_str);
    }

    // Convert Values
    int *int_values = NULL;
    double *double_values = NULL;

    if (sorting_method == 1) {
        int_values = (int *)malloc(num_elements * sizeof(int));
        if (int_values == NULL) {
            fprintf(stderr, "Error: Memory allocation failed.\n");
            return EXIT_FAILURE;
        }

        for (size_t i = 0; i < num_elements; i++) {
            int_values[i] = atoi(data[i]);
        }
    } else if (sorting_method == 2) {
        double_values = (double *)malloc(num_elements * sizeof(double));
        if (double_values == NULL) {
            fprintf(stderr, "Error: Memory allocation failed.\n");
            return EXIT_FAILURE;
        }

        for (size_t i = 0; i < num_elements; i++) {
            double_values[i] = atof(data[i]);
        }
    }

    // Sort Values
    if (sorting_method == 1) {
        quicksort(int_values, num_elements, sizeof(int), int_cmp);
        for (size_t i = 0; i < num_elements; i++) {
            sprintf(data[i], "%d", int_values[i]);
        }
        free(int_values);
    } else if (sorting_method == 2) {
        quicksort(double_values, num_elements, sizeof(double), dbl_cmp);
        for (size_t i = 0; i < num_elements; i++) {
            sprintf(data[i], "%f", double_values[i]);
        }
        free(double_values);
    } else if (sorting_method == 3) {
        quicksort(data, num_elements, sizeof(char*), str_cmp);
    } else {
        return EXIT_FAILURE;
    }

    //Print Sorted List
    for(size_t i = 0; i < num_elements; i++){
        printf("%s\n", data[i]);
    }

    //Free Allocated Memory
    for(size_t i = 0; i < num_elements; i++){
        free(data[i]);
    }

    free(data);

    return EXIT_SUCCESS;
}
