#include <stdio.h>
#include <string.h>
#include "quicksort.h"

/* Static (private to this file) function prototypes. */
static void swap(void *a, void *b, size_t size);
static int lomuto(void *array, int left, int right, size_t elem_sz,
                  int (*cmp) (const void*, const void*));
static void quicksort_helper(void *array, int left, int right, size_t elem_sz,
                             int (*cmp) (const void*, const void*));

/**
 * Swaps the values in two pointers.
 *
 * Casts the void pointers to type (char *) and works with them as char pointers
 * for the remainder of the function. Swaps one byte at a time, until all 'size'
 * bytes have been swapped. For example, if ints are passed in, size will be 4
 * and this function will swap 4 bytes starting at a and b pointers.
 */
static void swap(void *a, void *b, size_t size) {
    //cast void pointers
    char *pointera = (char*) a;
    char *pointerb = (char*) b;
    char temp;
    int swapped_bytes = 0;

    //swap byte
    while(swapped_bytes < size){
        temp = pointera[swapped_bytes];
        pointera[swapped_bytes] = pointerb[swapped_bytes];
        pointerb[swapped_bytes] = temp;
        swapped_bytes++;
    }
}

/**
 * Partitions array around a pivot, utilizing the swap function. Each time the
 * function runs, the pivot is placed into the correct index of the array in
 * sorted order. All elements less than the pivot should be to its left, and all
 * elements greater than or equal to the pivot should be to its right.
 */
static int lomuto(void *array, int left, int right, size_t elem_sz, int (*cmp) (const void*, const void*)) {
    char *arr = (char *) array;
    void *p = arr + left * elem_sz;
    int s = left;

    for (int j = left + 1; j<= right; j++) {
        void *i = arr + j * elem_sz;
        if (cmp(i, p) < 0) {
            s++;
            void *A_s = arr + s * elem_sz;
            swap(A_s, i, elem_sz);
        }
    }
    swap(arr + left * elem_sz, arr + s * elem_sz, elem_sz);
    return s;
}

/**
 * Sorts with lomuto partitioning, with recursive calls on each side of the
 * pivot.
 * This is the function that does the work, since it takes in both left and
 * right index values.
 */
static void quicksort_helper(void *array, int left, int right, size_t elem_sz, int (*cmp) (const void*, const void*)) {
    if (left < right) {
        int s = lomuto(array, left, right, elem_sz, cmp);
        quicksort_helper(array, left, s - 1, elem_sz, cmp);
        quicksort_helper(array, s + 1, right, elem_sz, cmp);
    }
}

//--------------------------------------------------------------------------------------------------------------

/**
 * Function Implementations:
 * int int_cmp(const void *a, const void *b);
 * int dbl_cmp(const void *a, const void *b);
 * int str_cmp(const void *a, const void *b);
 * void quicksort(void *array, size_t len, size_t elem_sz, int (*cmp) (const void*, const void*));
 */

/**
 * Compares two integers passed in as void pointers and returns an integer
 * representing their ordering.
 * First casts the void pointers to int pointers.
 * Returns:
 * -- 0 if the integers are equal
 * -- 1 if the first integer is greater
 * -- -1 if the second integer is greater
 */
int int_cmp(const void *a, const void *b){
    int *pointera = (int*) a;
    int *pointerb = (int*) b;

    if(*pointera == *pointerb){
        return 0;
    } else if(*pointera > *pointerb){
        return 1;
    } else{
        return -1;
    }
}

/**
 * Compares two doubles passed in as void pointers and returns an integer
 * representing their ordering.
 * First casts the void pointers to double pointers.
 * Returns:  
 * -- 0 if the doubles are equal
 * -- 1 if the first double is greater
 * -- -1 if the second double is greater
 */
int dbl_cmp(const void *a, const void *b){
    const double *pointera = (const double*) a;
    const double *pointerb = (const double*) b;

    if(*pointera == *pointerb){
        return 0;
    } else if(*pointera > *pointerb){
        return 1;
    } else{
        return -1;
    }
}

/**
 * Compares two char arrays passed in as void pointers and returns an integer
 * representing their ordering.
 * First casts the void pointers to char* pointers (i.e. char **).
 * Returns the result of calling strcmp on them.
 */
int str_cmp(const void *a, const void *b){
    const char *pointera = *(const char**) a;
    const char *pointerb = *(const char**) b;

    int result = strcmp(pointera, pointerb);

    return result;
}

/**
 * Quicksort function exposed to the user.
 * Calls quicksort_helper with left = 0 and right = len - 1.
 */
void quicksort(void *array, size_t len, size_t elem_sz, int (*cmp) (const void*, const void*)){
    quicksort_helper(array, 0, len - 1, elem_sz, cmp);
}

